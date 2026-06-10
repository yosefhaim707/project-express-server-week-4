export const asyncHandler = (routeHandler) => {
  return (request, response, next) => {
    Promise.resolve(routeHandler(request, response, next)).catch(next);
  };
};
