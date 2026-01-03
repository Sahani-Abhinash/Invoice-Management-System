using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Application.DTOs.Companies
{
    /// <summary>
    /// DTO used to create or update a company.
    /// </summary>
    public class CreateCompanyDto
    {
        /// <summary>
        /// Company name.
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

        /// <summary>
        /// Optional address id referencing structured addresses table.
        /// </summary>
        // Addresses are linked via EntityAddress; do not include AddressId on company create DTO.
    }
}
