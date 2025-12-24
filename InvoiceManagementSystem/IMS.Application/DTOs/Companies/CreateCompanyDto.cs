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
    }
}
