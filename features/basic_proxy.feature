Feature: Minimal Proxy Instance
  As a user of active-observer 
  I want to be able to start a proxy instance with minial options
  So that I can quickly start testing my application with the default options

  Scenario: Serving without Require Options
    Given I want to create a proxy instance with no options
    When I serve
    Then I see an error asking me to specify missing options

  Scenario: Serving without Base Server URL
    Given I want to create a proxy instance with the following options
      | OPTION   | VALUE   |
      | cacheDir | ./temp/ |
      | logLevel | error   |
    When I serve
    Then I see an error asking me to specify missing options

  Scenario: Serving without a cache directory URL
    Given I want to create a proxy instance with the following options
      | OPTION        | VALUE           |
      | serverBaseUrl | http://swapi.co |
      | logLevel      | error           |
    When I serve
    Then I see an error asking me to specify missing options

  Scenario: Serving with Required Options
    Given I want to create a proxy instance with the following options
      | OPTION        | VALUE           |
      | cacheDir      | ./temp/         |
      | serverBaseUrl | http://swapi.co |
      | logLevel      | error           |
    When I serve
    Then I see no error
