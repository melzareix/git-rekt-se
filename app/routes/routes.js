const AdminAuthAPI = require('./api/v1/admin/auth');
const AdminConfirmAPI = require('./api/v1/admin/verify');
const ClientAuthAPI = require('./api/v1/client/auth');
const BusinessAuthAPI = require('./api/v1/business/auth');
const BusinessEditInformationAPI = require('./api/v1/business/editinformation');
const ViewBussinessAPI = require('./api/v1/business/index');
const RelatedBusinessAPI = require('./api/v1/business/related');
const ClientProfileAPI = require('./api/v1/client/profile');
const ViewServiceAPI = require('./api/v1/service/index');
const RelatedServiceAPI = require('./api/v1/service/related');
const ServiceGalleryAPI = require('./api/v1/service/gallery');
const ReviewCRUDAPI = require('./api/v1/service/review');
const AdminCatAPI = require('./api/v1/admin/category');
const BusinessProfileAPI = require('./api/v1/business/profile');
const BusinessGalleryAPI = require('./api/v1/business/gallery');


module.exports = (app) => {
  /**
   * Visitor Routes.
   */

  app.use('/api/v1/service', ViewServiceAPI);
  app.use('/api/v1/business', ViewBussinessAPI);
  app.use('/api/v1/service/category', RelatedServiceAPI);
  app.use('/api/v1/business/category', RelatedBusinessAPI);

  /**
   * Client Routes.
   */

  app.use('/api/v1/client/auth', ClientAuthAPI);
  app.use('/api/v1/client/profile', ClientProfileAPI);

  /**
   * Business Routes.
   */

  app.use('/api/v1/business/auth', BusinessAuthAPI);
  app.use('/api/v1/business/profile', BusinessProfileAPI);
  app.use('/api/v1/business/info', BusinessEditInformationAPI);
  app.use('/api/v1/business/gallery', BusinessGalleryAPI);

  /**
   * Admin Routes.
   */

  app.use('/api/v1/admin/auth', AdminAuthAPI);
  app.use('/api/v1/admin/general', AdminConfirmAPI);
  app.use('/api/v1/admin/category', AdminCatAPI);

  /**
   * Service Routes.
   */
  app.use('/api/v1/service', ReviewCRUDAPI);
  app.use('/api/v1/service', ServiceGalleryAPI);
};
