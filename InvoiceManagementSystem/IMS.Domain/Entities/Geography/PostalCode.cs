using IMS.Domain.Common;

namespace IMS.Domain.Entities.Geography
{
    public class PostalCode : BaseEntity
    {
        public Guid CityId { get; set; }
        public City City { get; set; } = null!;

        public string Code { get; set; } = string.Empty;
    }
}