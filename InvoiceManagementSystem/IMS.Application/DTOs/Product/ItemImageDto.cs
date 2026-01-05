using System;

namespace IMS.Application.DTOs.Product
{
    public class ItemImageDto
    {
        public Guid Id { get; set; }
        public Guid ItemId { get; set; }
        public string ImageUrl { get; set; } = string.Empty;
        public bool IsMain { get; set; }
    }
}
