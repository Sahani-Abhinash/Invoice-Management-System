namespace IMS.Application.DTOs.Pricing
{
    public class CreatePriceListDto
    {
        public string Name { get; set; } = string.Empty;
        public bool IsDefault { get; set; }
    }
}
