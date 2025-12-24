using System;

namespace IMS.Application.DTOs.Product
{
    public class CreateItemDto
    {
        public string Name { get; set; } = string.Empty;
        public string SKU { get; set; } = string.Empty;
        public Guid UnitOfMeasureId { get; set; }
    }
}
