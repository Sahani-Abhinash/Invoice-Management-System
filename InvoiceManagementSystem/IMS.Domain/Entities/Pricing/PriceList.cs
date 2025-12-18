using IMS.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Domain.Entities.Pricing
{
    public class PriceList : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }
}
