const clientAuthAPI = require('./api/v1/client/auth');
const businessAuthAPI = require('./api/v1/business/auth');
const adminAuthAPI = require('./api/v1/admin/auth');
const serviceAPI = require('./api/v1/service/thing');

module.exports = (app) => {
  /**
   * Visitor Routes
   */

  /**
   * Client Routes
   */
  app.use('/api/v1/client/auth', clientAuthAPI);

  /**
   * Business Routes
   */
  app.use('/api/v1/client/auth', businessAuthAPI);

  /**
   * Admin Routes
   */
  app.use('/api/v1/admin/auth', adminAuthAPI);

  /**
   * Service Routes
   */
  app.use('/api/v1/service', serviceAPI);
};
