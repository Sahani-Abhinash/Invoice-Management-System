using IMS.Application.DTOs.Companies;
using System;

namespace IMS.Application.DTOs.Warehouses
{
    public class WarehouseDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public BranchDto Branch { get; set; } = null!;
    }
}
