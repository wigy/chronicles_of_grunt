/**
 * This is automatically generated template cache filler.
 */
(function() {

    angular.module("templates", []).run(["$templateCache", function($templateCache) {

        <% for (var i in FILES) { %>
            $templateCache.put("<%= i %>", <%= FILES[i] %> );
        <% } %>

    }]);
})();
