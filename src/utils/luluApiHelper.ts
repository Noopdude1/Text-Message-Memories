import axios from 'axios';


const LULU_AUTH_URL = "https://api.lulu.com/auth/realms/glasstree/protocol/openid-connect/token";
const LULU_PRINT_JOB_URL = "https://api.lulu.com/print-jobs/";
const LULU_PRINT_JOB_COST_URL = "https://api.lulu.com/print-job-cost-calculations/";

const LULU_AUTH_HEADER = "Basic NWFkNTQxMzktZDVhNC00MjJhLWI0ZTQtNzkzMmVhMTM3ZDU3OllYNFlvaFI5V3dNbnoxU29lam1kQzFZaENpZkg4WVdr"; // Replace with your Base64 encoded credentials

export interface ShippingInfo {
  city: string;
  country_code: string;
  name: string;
  phone_number: string;
  postcode: string;
  state_code?: string;
  street1: string;
  email: string;
}

export interface LineItem {
  external_id: string;
  printable_normalization: {
    cover: {
      source_url: string;
    };
    interior: {
      source_url: string;
    };
    pod_package_id: string;
  };
  quantity: number;
  title: string;
}

export interface LuluPrintJobResponse {
  id: number;
  line_items: Array<{
    id: number;
    title: string;
    printable_normalization: {
      interior: {
        source_url: string;
      };
      cover: {
        source_url: string;
      };
      pod_package_id: string;
    };
    status: {
      name: string;
      messages: {
        info: string;
      };
    };
    quantity: number;
  }>;
  status: {
    name: string;
    message: string;
    changed: string;
  };
  costs: {
    shipping_cost?: number;
    line_item_costs?: number;
    total_cost_excl_tax?: number;
    total_tax?: number;
    total_cost_incl_tax?: number;
    currency?: string;
  };
  shipping_address: ShippingInfo;
}

/**
 * Get Bearer Token from Lulu API
 * @returns {Promise<string>} Bearer token
 */
export const getLuluAuthToken = async (): Promise<string> => {
    try {
      const formData = "grant_type=client_credentials";

      const config = {
        method: "post",
        url: LULU_AUTH_URL,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: LULU_AUTH_HEADER,
        },
        data: formData,
      };

      const response = await axios.request(config);

      console.log("Lulu API Auth Response:", response.data);

      if (response.data && response.data.access_token) {
        return response.data.access_token;
      } else {
        throw new Error("Failed to retrieve Lulu API access token.");
      }
    } catch (error) {
      console.error("Error fetching Lulu API token:", error);
      if (axios.isAxiosError(error)) {
        console.error("Axios error response:", error.response?.data);
      }
      throw error;
    }
  };

/**
 * Create a print job with Lulu API
 * @param {ShippingInfo} shippingInfo - Shipping address information
 * @param {LineItem[]} lineItems - List of line items to print
 * @returns {Promise<LuluPrintJobResponse>} Lulu API print job response
 */
export const createLuluPrintJob = async (
    shippingInfo: ShippingInfo,
    lineItems: LineItem[]
  ): Promise<LuluPrintJobResponse> => {
    try {
      const token = await getLuluAuthToken();
      console.log("🚀 ~ Token retrieved:", token);

      if (!token) throw new Error("Token not generated!");

      const payload = JSON.stringify({
        contact_email: shippingInfo.email,
        external_id: `order-${Date.now()}`,
        line_items: lineItems,
        production_delay: 120,
        shipping_address: {
          city: shippingInfo.city,
          country_code: shippingInfo.country_code,
          name: shippingInfo.name,
          phone_number: shippingInfo.phone_number,
          postcode: shippingInfo.postcode,
          state_code: shippingInfo.state_code || "",
          street1: shippingInfo.street1,
        },
        shipping_level: "MAIL",
      });

      const config = {
        method: "post",
        maxBodyLength: Infinity,
        url: LULU_PRINT_JOB_URL,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        data: payload,
      };

      console.log("🚀 ~ Sending payload to Lulu API:", payload);

      const response = await axios.request(config);

      console.log("Lulu Print Job Response:", response.data);

      return response.data as LuluPrintJobResponse;
    } catch (error) {
      console.error("Error creating Lulu print job:", error);

      if (axios.isAxiosError(error)) {
        console.error("Axios error response:", error.response?.data);

        // Log detailed error fields for better debugging
        if (error.response?.data) {
          console.error("Error Details:", JSON.stringify(error.response.data, null, 2));

          if (error.response.data.shipping_address?.detail) {
            console.error("Shipping Address Errors:", JSON.stringify(error.response.data.shipping_address.detail, null, 2));
          }

          if (error.response.data.errors) {
            console.error("General Errors:", JSON.stringify(error.response.data.errors, null, 2));
          }
        }
      } else {
        console.error("Non-Axios Error:", error);
      }

      throw error;
    }
  };


  /**
 * Validate the shipping address using Lulu’s Print‑Job Cost Calculations API.
 * This method sends realistic data (a sample line item, shipping address, and shipping option)
 * to the endpoint. The API’s response may include warnings (e.g. "incomplete") or suggested
 * corrections that your client can use to notify the user.
 *
 * @param {ShippingInfo} shippingInfo - The shipping address to validate.
 * @returns {Promise<any>} The parsed response data from the API.
 */
export const validateLuluShippingAddress = async (
  shippingInfo: ShippingInfo
): Promise<any> => {
  try {
    const token = await getLuluAuthToken();
    console.log("Token retrieved for address validation:", token);

    // Build a payload using realistic data.
    const payload = {
      line_items: [
        {
          page_count: 32,
          pod_package_id: "0425X0687FCPRESS060UW444GXX",
          quantity: 1,
        },
      ],
      shipping_address: {
        city: shippingInfo.city,
        country_code: shippingInfo.country_code,
        postcode: shippingInfo.postcode,
        state_code: shippingInfo.state_code || "",
        street1: shippingInfo.street1,
        phone_number: shippingInfo.phone_number,
      },
      shipping_option: "EXPRESS",
    };

    const config = {
      method: "post",
      url: LULU_PRINT_JOB_COST_URL,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
      },
      data: JSON.stringify(payload),
    };

    console.log("Sending address validation payload to Lulu API:", payload);

    const response = await axios.request(config);
    console.log("Lulu Address Validation Response:", response.data);

    return response.data;
  } catch (error) {
    console.error("Error validating Lulu shipping address:", error);
    if (axios.isAxiosError(error)) {
      console.error("Axios error response:", error.response?.data);
    }
    throw error;
  }
};
