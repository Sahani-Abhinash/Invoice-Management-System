using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Domain.Common
{
    public abstract class BaseEntity
    {
        public Guid Id { get; set; }
        // Audit fields
        public Guid? CreatedBy { get; set; }
        public Guid? UpdatedBy { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Soft-delete and status
        public bool IsActive { get; set; } = true;
        public bool IsDeleted { get; set; } = false;
        public Guid? DeletedBy { get; set; }
        public DateTime? DeletedAt { get; set; }

        // Concurrency
        public byte[]? RowVersion { get; set; }
    }
}
