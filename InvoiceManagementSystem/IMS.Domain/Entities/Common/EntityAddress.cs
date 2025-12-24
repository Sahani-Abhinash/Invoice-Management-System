using IMS.Domain.Common;
using System;

namespace IMS.Domain.Entities.Common
{
    // Flexible linking table so any entity can have multiple addresses
    public class EntityAddress : BaseEntity
    {
        public Guid AddressId { get; set; }
        public Address Address { get; set; } = null!;

        // e.g. OwnerType.User, OwnerType.Branch, OwnerType.Customer
        public IMS.Domain.Enums.OwnerType OwnerType { get; set; } = IMS.Domain.Enums.OwnerType.User;
        public Guid OwnerId { get; set; }

        public bool IsPrimary { get; set; }
    }
}
