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
    }
}
