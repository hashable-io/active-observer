Feature: Proxy Modes 

  @TestServer
  Scenario: proxy_only mode
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
    And I can see 0 cache files for "/increment"

  Scenario: cache_only mode
    Given I want to create a proxy instance with the following options
      | OPTION        | VALUE                 |
      | cacheDir      | ./features/fixtures/  |
      | mode          | cache_only            |
			| port          | 9000                  |
      | serverBaseUrl | http://localhost:9001 |
    And I serve
    When I make a "GET" request to "/getCount"
    Then I see the result "0"
    When I make a "GET" request to "/increment"
    Then I make a "GET" request to "/getCount"
    And I see the result "0"
    And I can see 1 cache files for "/getCount"
    And I can see 1 cache files for "/increment"

  @TestServer
  Scenario: proxy_with_cache mode
    Given I want to create a proxy instance with the following options
      | OPTION        | VALUE                 |
      | cacheDir      | ./temp/               |
      | mode          | proxy_with_cache      |
			| port          | 9000                  |
      | serverBaseUrl | http://localhost:9001 |
    And I serve
    When I make a "GET" request to "/getCount"
    Then I see the result "0"
    When I make a "GET" request to "/increment"
    Then I make a "GET" request to "/getCount"
    And I see the result "0"
    And I can see 1 cache files for "/getCount"
    And I can see 1 cache files for "/increment"
