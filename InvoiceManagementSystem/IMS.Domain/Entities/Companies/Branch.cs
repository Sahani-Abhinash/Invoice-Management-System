using IMS.Domain.Common;
using warehouse = IMS.Domain.Entities.Warehouse;

namespace IMS.Domain.Entities.Companies
{
    public class Branch : BaseEntity
    {
        public Guid CompanyId { get; set; }
        public Company Company { get; set; } = null!;

        public string Name { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;

        public ICollection<warehouse.Warehouse> Warehouses { get; set; } = new List<warehouse.Warehouse>();
    }
}
