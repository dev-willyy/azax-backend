import customError from '../utilities/customError';

const updateNotificationStatus = (req, res, next) => {
  const id = req.user.userId;
  const { userId } = req.params;

  const { notificationStatus } = req.body;

  try {
    if (!userId) {
      throw new customError('User Id is required', 405);
    }

    if (userId !== id) {
      throw new customError('User unauthorized to update resource', 401);
    }

    if (!notificationStatus) {
      throw new customError('Notification status is required', 405);
    }
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

const getNotificationStatus = (req, res, next) => {};

export { updateNotificationStatus };
