const axios = require('axios');
const { verifyCustomerConfig } = require('../config/thirdPartyConfigs.js');
const handleCustomErrorResponse = require('../utilities/handleCustomErrorResponse.js');
const customError = require('../utilities/customError.js');

const fetchAllSupportedCountries = async (req, res) => {
  try {
    const response = await axios.get('https://api.paystack.co/country', verifyCustomerConfig);

    const { status, statusText, data } = response;

    if (status !== 200) {
      throw new customError('An error occurred while fetching countries.', 500);
    }

    const { message, data: countriesData } = data;

    let countriesInfoArr = [];

    countriesData.map((countryInfo) => {
      return countriesInfoArr.push({
        id: countryInfo.id,
        name: countryInfo.name,
        isoCode: countryInfo.iso_code,
        curerncyCode: countryInfo.default_currency_code,
        callingCode: countryInfo.calling_code,
      });
    });

    return res.status(status).json({
      statusText,
      message,
      countriesData: countriesInfoArr,
    });
  } catch (error) {
    handleCustomErrorResponse(res, error);
  }
};

// Controller function to validate/verify customer's details using Paystack API
const verifyCustomerDetails = async (req, res) => {
  try {
    // Customer details to be sent in the request
    const params = {
      country: 'NG',
      type: 'bank_account',
      account_number: '0123456789',
      bvn: '200123456677',
      bank_code: '007',
      first_name: 'Asta',
      last_name: 'Lavista',
    };

    // Configuration for the Axios request

    const response = await axios.post(
      'https://api.paystack.co/customer/{customer_code}/identification',
      params,
      verifyCustomerConfig
    );

    console.log(response);

    res.status(200).json(response.data);
  } catch (error) {
    // res.status(500).json({
    //   error: 'An error occurred while verifying customer details.',
    // });
    handleCustomErrorResponse(res, error);
  }
};

module.exports = {
  fetchAllSupportedCountries,
  verifyCustomerDetails,
};
