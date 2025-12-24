using IMS.Domain.Common;

namespace IMS.Domain.Entities.Geography
{
    public class Country : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string ISOCode { get; set; } = string.Empty;

        public ICollection<State> States { get; set; } = new List<State>();
    }
}