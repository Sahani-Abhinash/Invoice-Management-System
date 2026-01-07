using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Application.DTOs.Product
{
    public class ItemPropertyAttributeDto
    {
        public Guid Id { get; set; }
        public Guid ItemId { get; set; }
        public Guid PropertyAttributeId { get; set; }
        public string? PropertyAttributeName { get; set; }
        public string? PropertyName { get; set; }
        public string? AttributeValue { get; set; }
        public string? Notes { get; set; }
        public int DisplayOrder { get; set; }
    }

    public class CreateItemPropertyAttributeDto
    {
        public Guid ItemId { get; set; }
        public Guid PropertyAttributeId { get; set; }
        public string? Notes { get; set; }
        public int DisplayOrder { get; set; } = 0;
    }

    public class UpdateItemPropertyAttributeDto
    {
        public Guid Id { get; set; }
        public Guid ItemId { get; set; }
        public Guid PropertyAttributeId { get; set; }
        public string? Notes { get; set; }
        public int DisplayOrder { get; set; }
    }
}
