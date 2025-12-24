using System;

namespace IMS.Application.DTOs.Product
{
    public class UnitOfMeasureDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Symbol { get; set; } = string.Empty;
    }
}
