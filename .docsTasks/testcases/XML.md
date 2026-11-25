# XML Catalog Tests

## Test Cases

### TC-XML-01: GET /updatePlugins.xml serves valid XML
**Given**: Admin has added plugins  
**When**: GET /updatePlugins.xml (no auth required)  
**Then**: Returns 200 with application/xml Content-Type
- XML root contains <plugin> elements
- Each plugin has id, url, version, idea-version

### TC-XML-02: XML TTL cache (60s)
**Given**: Admin modifies a plugin via admin endpoint  
**When**: 
- Immediately after change: GET /updatePlugins.xml returns new catalog
- Within 59 seconds of last change: same cached response served
- After 60+ seconds without changes: still serving old catalog

### TC-XML-03: markDirty invalidates cache immediately
**Given**: Background build not yet started  
**When**: Admin creates/upserts plugin → markDirty() called  
**Then**: Next GET /updatePlugins.xml triggers immediate rebuild

### TC-XML-04: XML validation skips invalid plugins
**Given**: Plugin with missing required field (e.g., no name)  
**When**: Admin upserts such plugin  
**Then**: 
- Backend logs warning "Skipping plugin X..."
- Next GET /updatePlugins.xml omits this plugin
- No exception thrown

### TC-XML-05: Cache-Control header is no-cache
**Given**: Any request to /updatePlugins.xml  
**When**: Inspect response headers  
**Then**: Cache-Control = "no-cache" (per spec)

