const { validate } = require('../middleware/validationMiddleware');
const { errorHandler } = require('../middleware/errorMiddleware');

describe('ERP Input Validation Middleware Tests', () => {
  it('should return 400 validation error if registration fields are missing', () => {
    const middleware = validate('register');
    const req = {
      body: {
        name: 'John',
        // missing email, password, role
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Validation failed'
      })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('should pass validation if registration details are complete and valid', () => {
    const middleware = validate('register');
    const req = {
      body: {
        name: 'John Doe',
        email: 'john@company.com',
        password: 'securepassword123',
        role: 'Sales'
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 400 validation error if order contains empty products list', () => {
    const middleware = validate('order');
    const req = {
      body: {
        customer: '60c72b2f9b1d8b2bad034a2e',
        products: [] // should have at least 1 item
      }
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
  });
});

describe('ERP Global Error Handler Middleware Tests', () => {
  it('should format error stack/message into a clean JSON response', () => {
    const err = new Error('Test Server Issue');
    const req = {};
    const res = {
      statusCode: 200, // should default to 500
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    const next = jest.fn();

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Test Server Issue'
      })
    );
  });
});
