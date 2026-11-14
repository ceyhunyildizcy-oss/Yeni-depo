package com.aiasistan.planner

import org.junit.Assert.*
import org.junit.Test

class ApprovalWorkflowTest {
    private fun request() = ApprovalRequest(
        source = "whatsapp_notification",
        sourceId = "notif-42",
        action = ProposedAction.CREATE_CALENDAR_EVENT,
        title = "Müşteriyi ara",
        details = "Önerilen saat: 14:30"
    )

    @Test fun proposingDoesNotExecute() {
        var calls = 0
        val flow = ApprovalWorkflow(InMemoryApprovalStore(), ActionExecutor { calls++ })
        flow.propose(request())
        assertEquals(0, calls)
    }

    @Test fun executingWithoutApprovalIsForbidden() {
        val flow = ApprovalWorkflow(InMemoryApprovalStore(), ActionExecutor { })
        val req = flow.propose(request())
        try {
            flow.executeApproved(req.id)
            fail("Should require approval")
        } catch (expected: IllegalArgumentException) { }
    }

    @Test fun approvedRequestCanExecute() {
        var calls = 0
        val flow = ApprovalWorkflow(InMemoryApprovalStore(), ActionExecutor { calls++ })
        val req = flow.propose(request())
        flow.approve(req.id)
        assertEquals(ApprovalStatus.EXECUTED, flow.executeApproved(req.id).status)
        assertEquals(1, calls)
    }

    @Test fun rejectedRequestCannotExecute() {
        val flow = ApprovalWorkflow(InMemoryApprovalStore(), ActionExecutor { })
        val req = flow.propose(request())
        flow.reject(req.id)
        try {
            flow.executeApproved(req.id)
            fail("Rejected action must not execute")
        } catch (expected: IllegalArgumentException) { }
    }

    @Test fun failedExecutionDoesNotMarkExecuted() {
        val flow = ApprovalWorkflow(InMemoryApprovalStore(), ActionExecutor { error("network") })
        val req = flow.propose(request())
        flow.approve(req.id)
        assertEquals(ApprovalStatus.FAILED, flow.executeApproved(req.id).status)
    }
}
