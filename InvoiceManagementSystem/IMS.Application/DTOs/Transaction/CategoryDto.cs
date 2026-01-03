using IMS.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace IMS.Application.DTOs.Transaction
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public IncomeExpenseType Type { get; set; }
        public string TypeName => Type.ToString();
        public bool IsSystemCategory { get; set; }
    }

    public class CreateCategoryDto
    {
        [Required(ErrorMessage = "Category name is required")]
        public string Name { get; set; } = string.Empty;
        
        public string? Description { get; set; }
        
        [Required(ErrorMessage = "Category type is required")]
        public IncomeExpenseType Type { get; set; }
    }
}
