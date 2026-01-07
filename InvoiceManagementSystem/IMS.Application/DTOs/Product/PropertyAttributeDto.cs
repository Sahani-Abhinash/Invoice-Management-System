using System;

namespace IMS.Application.DTOs.Product
{
    public class PropertyAttributeDto
    {
        public Guid Id { get; set; }
        public Guid ProductPropertyId { get; set; }
        public string ProductPropertyName { get; set; } = string.Empty;
        public string Value { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; }
        public string? Metadata { get; set; }
    }

    public class CreatePropertyAttributeDto
    {
        public Guid ProductPropertyId { get; set; }
        public string Value { get; set; } = string.Empty;
        public string? Description { get; set; }
        public int DisplayOrder { get; set; } = 0;
        public string? Metadata { get; set; }
    }
}
