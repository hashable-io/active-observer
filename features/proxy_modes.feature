Feature: Proxy Modes 
  As a user of active-observer 
  I want to configure the caching for the proxy

  @TestServer
  Scenario: Proxing without cache
    Given I want to create a proxy instance with the following options
      | OPTION        | VALUE                 |
      | cacheDir      | ./temp/               |
      | mode          | proxy_only            |
			| port          | 9000                  |
      | serverBaseUrl | http://localhost:9001 |
    And I serve
    When I make a "GET" request to "/getCount"
    Then I see the result "0"
    When I make a "GET" request to "/increment"
    Then I make a "GET" request to "/getCount"
    And I see the result "1"
    And I can see 0 cache files for "/getCount"
