using IMS.Domain.Common;
using warehouse = IMS.Domain.Entities.Warehouse;

namespace IMS.Domain.Entities.Companies
{
    public class Branch : BaseEntity
    {
        // Branch is independent and does not reference Company in the domain model.

        public string Name { get; set; } = string.Empty;

        public ICollection<warehouse.Warehouse> Warehouses { get; set; } = new List<warehouse.Warehouse>();
    }
}
