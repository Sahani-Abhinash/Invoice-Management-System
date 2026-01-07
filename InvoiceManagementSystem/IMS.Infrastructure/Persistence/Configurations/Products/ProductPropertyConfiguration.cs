using IMS.Domain.Entities.Product;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IMS.Infrastructure.Persistence.Configurations.Products
{
    public class ProductPropertyConfiguration : IEntityTypeConfiguration<ProductProperty>
    {
        public void Configure(EntityTypeBuilder<ProductProperty> builder)
        {
            builder.ToTable("ProductProperties");

            builder.HasKey(p => p.Id);

            builder.Property(p => p.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(p => p.Description)
                .HasMaxLength(500);

            builder.Property(p => p.DisplayOrder)
                .IsRequired();

            builder.HasIndex(p => p.Name);

            builder.HasMany(p => p.Attributes)
                .WithOne(a => a.ProductProperty)
                .HasForeignKey(a => a.ProductPropertyId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
