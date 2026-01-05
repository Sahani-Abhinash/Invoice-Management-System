using IMS.Application.DTOs.Product;
using IMS.Application.Managers.Product;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;

namespace IMS.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ItemImageController : ControllerBase
    {
        private readonly IItemImageManager _manager;
        private readonly IItemManager _itemManager;

        public ItemImageController(IItemImageManager manager, IItemManager itemManager)
        {
            _manager = manager;
            _itemManager = itemManager;
        }

        /// <summary>
        /// Get all item images.
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _manager.GetAllAsync();
            return Ok(result);
        }

        /// <summary>
        /// Get item image by id.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var result = await _manager.GetByIdAsync(id);
            if (result == null) return NotFound();
            return Ok(result);
        }

        /// <summary>
        /// Get images for an item.
        /// </summary>
        [HttpGet("item/{itemId}")]
        public async Task<IActionResult> GetByItemId(Guid itemId)
        {
            var result = await _manager.GetByItemIdAsync(itemId);
            return Ok(result);
        }

        /// <summary>
        /// Upload an image for an item (follows Company Logo pattern).
        /// </summary>
        [HttpPost("{itemId}/upload")]
        public async Task<IActionResult> UploadImage(Guid itemId, IFormFile file)
        {
            // Validate file
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded");

            // Check file size (max 5MB)
            if (file.Length > 5 * 1024 * 1024)
                return BadRequest("File size exceeds 5MB limit");

            // Validate file type
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(fileExtension))
                return BadRequest("Invalid file type. Allowed: jpg, jpeg, png, gif, webp");

            try
            {
                // Verify item exists
                var item = await _itemManager.GetByIdAsync(itemId);
                if (item == null)
                    return NotFound("Item not found");

                // Create uploads directory if it doesn't exist
                var uploadsDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "items", itemId.ToString());
                Directory.CreateDirectory(uploadsDir);

                // Save new file with unique name (GUID to avoid conflicts)
                var fileName = $"{Guid.NewGuid()}{fileExtension}";
                var filePath = Path.Combine(uploadsDir, fileName);

                // Save file
                using (var stream = new FileStream(filePath, FileMode.Create))
                {
                    await file.CopyToAsync(stream);
                }

                // Build URL
                var imageUrl = $"/uploads/items/{itemId}/{fileName}";

                // Create image record in database
                var dto = new CreateItemImageDto
                {
                    ItemId = itemId,
                    ImageUrl = imageUrl,
                    IsMain = false
                };

                var result = await _manager.CreateAsync(dto);

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error uploading image: {ex.Message}");
            }
        }

        /// <summary>
        /// Create an item image (metadata only - no file upload).
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateItemImageDto dto)
        {
            var created = await _manager.CreateAsync(dto);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        /// <summary>
        /// Update an item image.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] CreateItemImageDto dto)
        {
            var updated = await _manager.UpdateAsync(id, dto);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        /// <summary>
        /// Delete an item image.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var deleted = await _manager.DeleteAsync(id);
            if (!deleted) return NotFound();
            return NoContent();
        }
    }
}
