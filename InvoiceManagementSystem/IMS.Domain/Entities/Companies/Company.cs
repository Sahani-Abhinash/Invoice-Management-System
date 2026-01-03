using IMS.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using IMS.Domain.Entities.Common;

namespace IMS.Domain.Entities.Companies
{
    public class Company : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string TaxNumber { get; set; } = string.Empty;

        // Contact / business information useful on invoices, POs and GRNs
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;

        // Optional logo URL to display on printed documents
        public string? LogoUrl { get; set; }

        // Default currency for the company
        public Guid? DefaultCurrencyId { get; set; }

        // Addresses are handled via EntityAddress linking table; do not keep direct Address navigation here.
        // Company should not contain an in-memory collection of branches to avoid coupling.
    }
}
