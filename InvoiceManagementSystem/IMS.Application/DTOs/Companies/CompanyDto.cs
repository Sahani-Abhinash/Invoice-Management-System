using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Application.DTOs.Companies
{
    /// <summary>
    /// Data Transfer Object representing a company returned by APIs.
    /// </summary>
    public class CompanyDto
    {
        /// <summary>
        /// Unique identifier for the company.
        /// </summary>
        public Guid Id { get; set; }

        /// <summary>
        /// Company display name.
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Tax registration number.
        /// </summary>
        public string TaxNumber { get; set; } = string.Empty;
        
        /// <summary>
        /// Contact email for the company (used on invoices/POs).
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Contact phone for the company.
        /// </summary>
        public string Phone { get; set; } = string.Empty;

        /// <summary>
        /// Optional URL to a company logo to show on printed documents.
        /// </summary>
        public string? LogoUrl { get; set; }

        /// <summary>
        /// Default currency ID for the company.
        /// </summary>
        public Guid? DefaultCurrencyId { get; set; }

        // Addresses are provided by AddressService via EntityAddress links. See AddressController for linking.
    }
}
