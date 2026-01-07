using IMS.Application.DTOs.Product;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Application.Managers.Product
{
    public interface IItemPropertyAttributeManager
    {
        Task<ItemPropertyAttributeDto> GetByIdAsync(Guid id);
        Task<List<ItemPropertyAttributeDto>> GetAllAsync();
        Task<List<ItemPropertyAttributeDto>> GetByItemIdAsync(Guid itemId);
        Task<List<ItemPropertyAttributeDto>> GetByPropertyAttributeIdAsync(Guid propertyAttributeId);
        Task<ItemPropertyAttributeDto> CreateAsync(CreateItemPropertyAttributeDto dto);
        Task<ItemPropertyAttributeDto> UpdateAsync(UpdateItemPropertyAttributeDto dto);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> DeleteByItemIdAsync(Guid itemId);
    }
}
