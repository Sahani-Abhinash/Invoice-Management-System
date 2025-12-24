using IMS.Domain.Common;

namespace IMS.Domain.Entities.Geography
{
    public class City : BaseEntity
    {
        public Guid StateId { get; set; }
        public State State { get; set; } = null!;

        public string Name { get; set; } = string.Empty;

        public ICollection<PostalCode> PostalCodes { get; set; } = new List<PostalCode>();
    }
}