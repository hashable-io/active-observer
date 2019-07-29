import { After } from 'cucumber';

After(function () {
  // Clean Up After Every Scenario:
  if (this.proxy) {
    this.proxy.shutdown();
    this.proxy = null;
  }
  this.options = null;
  this.error = null;
});
