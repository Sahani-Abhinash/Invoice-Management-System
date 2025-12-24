using IMS.Domain.Common;

namespace IMS.Domain.Entities.Geography
{
    public class State : BaseEntity
    {
        public Guid CountryId { get; set; }
        public Country Country { get; set; } = null!;

        public string Name { get; set; } = string.Empty;

        public ICollection<City> Cities { get; set; } = new List<City>();
    }
}