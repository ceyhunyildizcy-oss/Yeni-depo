package com.aiasistan.planner

import java.time.Instant
import java.util.UUID

/** Sensitive content stays on device. Callers must persist records in encrypted storage. */
enum class ApprovalStatus { PENDING, APPROVED, REJECTED, EXECUTED, FAILED }
enum class ProposedAction { CREATE_CALENDAR_EVENT, SEND_EMAIL, SEND_SMS, SEND_WHATSAPP, DELETE_ITEM }

data class ApprovalRequest(
    val id: String = UUID.randomUUID().toString(),
    val source: String,
    val sourceId: String,
    val action: ProposedAction,
    val title: String,
    val details: String,
    val proposedAt: Instant = Instant.now(),
    val status: ApprovalStatus = ApprovalStatus.PENDING,
    val approvedAt: Instant? = null,
    val executedAt: Instant? = null
)

/**
 * Explicit approval boundary. Only trusted UI handlers should invoke approve/reject.
 * Executor must validate permissions, target, calendar conflicts and idempotency again.
 * No auto-send or auto-calendar writes in propose().
 */
class ApprovalWorkflow(
    private val store: ApprovalStore,
    private val executor: ActionExecutor
) {
    fun propose(request: ApprovalRequest): ApprovalRequest {
        require(request.status == ApprovalStatus.PENDING)
        require(request.title.isNotBlank())
        require(request.sourceId.isNotBlank())
        require(store.get(request.id) == null) { "Duplicate request id" }
        store.save(request)
        return request
    }

    fun approve(id: String): ApprovalRequest {
        val current = store.get(id) ?: error("Request not found")
        require(current.status == ApprovalStatus.PENDING) { "Only pending requests can be approved" }
        val updated = current.copy(status = ApprovalStatus.APPROVED, approvedAt = Instant.now())
        store.save(updated)
        return updated
    }

    fun reject(id: String): ApprovalRequest {
        val current = store.get(id) ?: error("Request not found")
        require(current.status == ApprovalStatus.PENDING) { "Only pending requests can be rejected" }
        val updated = current.copy(status = ApprovalStatus.REJECTED)
        store.save(updated)
        return updated
    }

    /** Call only after approval; persist EXECUTED only after the platform confirms success. */
    fun executeApproved(id: String): ApprovalRequest {
        val current = store.get(id) ?: error("Request not found")
        require(current.status == ApprovalStatus.APPROVED) { "User approval required" }
        // Production: serialize per-id execution in a durable transaction/outbox to avoid double sends.
        return try {
            executor.execute(current)
            current.copy(status = ApprovalStatus.EXECUTED, executedAt = Instant.now()).also(store::save)
        } catch (e: Exception) {
            current.copy(status = ApprovalStatus.FAILED).also(store::save)
        }
    }
}

interface ApprovalStore {
    fun get(id: String): ApprovalRequest?
    fun save(request: ApprovalRequest)
}

fun interface ActionExecutor {
    /** Throws on failure; must use platform-specific authorization and idempotency. */
    fun execute(request: ApprovalRequest)
}

class InMemoryApprovalStore : ApprovalStore {
    private val entries = mutableMapOf<String, ApprovalRequest>()
    override fun get(id: String): ApprovalRequest? = entries[id]
    override fun save(request: ApprovalRequest) { entries[request.id] = request }
    fun pending(): List<ApprovalRequest> = entries.values.filter { it.status == ApprovalStatus.PENDING }
}
