using IMS.Domain.Common;
using IMS.Domain.Entities.Companies;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Domain.Entities.Warehouse
{
    public class Warehouse : BaseEntity
    {
        public Guid BranchId { get; set; }
        public Branch Branch { get; set; } = null!;

        public string Name { get; set; } = string.Empty;
    }
}
