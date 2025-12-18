using IMS.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Domain.Entities.Company
{
    public class Company : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string TaxNumber { get; set; } = string.Empty;

        public ICollection<Branch> Branches { get; set; } = new List<Branch>();
    }
}
