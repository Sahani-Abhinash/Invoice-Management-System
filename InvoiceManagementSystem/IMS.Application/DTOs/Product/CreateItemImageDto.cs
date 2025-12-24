using System;

namespace IMS.Application.DTOs.Product
{
    public class CreateItemImageDto
    {
        public Guid ItemId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsMain { get; set; }
    }
}
