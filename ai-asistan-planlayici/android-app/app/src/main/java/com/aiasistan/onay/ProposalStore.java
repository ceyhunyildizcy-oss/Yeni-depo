package com.aiasistan.onay;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONObject;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/** Local-only queue. Never performs sending or calendar writes. */
public final class ProposalStore {
    private final SharedPreferences preferences;
    public ProposalStore(Context context) {
        preferences = context.getApplicationContext().getSharedPreferences("onayli_plan", Context.MODE_PRIVATE);
    }
    public static String keyFor(String source, String body, long when) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(
                (source + "\n" + body + "\n" + when).getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (int i=0;i<12;i++) sb.append(String.format(java.util.Locale.ROOT,"%02x",digest[i] & 255));
            return sb.toString();
        } catch (Exception e) { throw new IllegalStateException(e); }
    }
    private JSONArray getArray() {
        try { return new JSONArray(preferences.getString("proposals","[]")); }
        catch(Exception e) { return new JSONArray(); }
    }
    public synchronized boolean add(String source,String body,long timestamp) {
        if (body == null || body.trim().isEmpty()) return false;
        body=body.trim();
        String id=keyFor(source,body,timestamp);
        JSONArray arr=getArray();
        for(int i=0;i<arr.length();i++) if(id.equals(arr.optJSONObject(i).optString("id"))) return false;
        JSONObject object=new JSONObject();
        try {
            object.put("id",id);object.put("source",source);object.put("text",body.length()>500?body.substring(0,500):body);
            object.put("time",timestamp); object.put("state","PENDING");
            arr.put(object);
            // Bound local retention to 100 records; user may clear at any time.
            JSONArray bounded=new JSONArray();
            for (int i=Math.max(0,arr.length()-100);i<arr.length();i++) bounded.put(arr.get(i));
            return preferences.edit().putString("proposals",bounded.toString()).commit();
        } catch (Exception e) { return false; }
    }
    public synchronized List<JSONObject> all() {
        JSONArray arr=getArray(); List<JSONObject> list=new ArrayList<>();
        for(int i=arr.length()-1;i>=0;i--) if(arr.optJSONObject(i)!=null) list.add(arr.optJSONObject(i));
        return list;
    }
    public synchronized boolean setStatus(String id,String next) {
        if (!"APPROVED".equals(next) && !"REJECTED".equals(next)) return false;
        JSONArray arr=getArray();
        for(int i=0;i<arr.length();i++){
            JSONObject p=arr.optJSONObject(i);
            if(p!=null && id.equals(p.optString("id")) && "PENDING".equals(p.optString("state"))) {
                try {p.put("state",next);return preferences.edit().putString("proposals",arr.toString()).commit();}
                catch (Exception e){return false;}
            }
        }
        return false;
    }
    public synchronized void clear() { preferences.edit().remove("proposals").commit(); }
}
