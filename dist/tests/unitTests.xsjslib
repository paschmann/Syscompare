/*global jasmine, describe, beforeOnce, it, expect*/
describe("SysCompare Test Suite", function() {

    var sysapi = '/lilabs/syscompare/lib/api.xsjs';

    function callAPI(queryString) {
        var contentTypeHeader = {
            "Content-Type": "application/json"
        };
        var response = jasmine.callHTTPService(sysapi + queryString, $.net.http.GET, "", contentTypeHeader);
        return response.body ? response.body.asString() : "";
    }

    it("API should be available", function() {
        var response = jasmine.callHTTPService(sysapi);
        expect(response.status).toBe($.net.http.OK);
    });

    it("API: Test read function, expects system1, system2, path", function() {
        var requestQuery = '?service=read&system1=prod&system2=dev&path=lilabs/metric2/css';
        var response = callAPI(requestQuery);
        expect(response).not.toMatch(/error/);
    });

});