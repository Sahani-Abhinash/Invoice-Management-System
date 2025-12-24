using System;

namespace IMS.Application.DTOs.Warehouses
{
    public class CreateWarehouseDto
    {
        public Guid BranchId { get; set; }
        public string Name { get; set; } = string.Empty;
    }
}
