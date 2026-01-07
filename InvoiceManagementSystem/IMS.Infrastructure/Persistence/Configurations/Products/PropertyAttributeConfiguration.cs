using IMS.Domain.Entities.Product;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace IMS.Infrastructure.Persistence.Configurations.Products
{
    public class PropertyAttributeConfiguration : IEntityTypeConfiguration<PropertyAttribute>
    {
        public void Configure(EntityTypeBuilder<PropertyAttribute> builder)
        {
            builder.ToTable("PropertyAttributes");

            builder.HasKey(a => a.Id);

            builder.Property(a => a.Value)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(a => a.Description)
                .HasMaxLength(500);

            builder.Property(a => a.DisplayOrder)
                .IsRequired();

            builder.Property(a => a.Metadata)
                .HasMaxLength(1000);

            builder.HasIndex(a => a.ProductPropertyId);
            builder.HasIndex(a => new { a.ProductPropertyId, a.Value });

            builder.HasOne(a => a.ProductProperty)
                .WithMany(p => p.Attributes)
                .HasForeignKey(a => a.ProductPropertyId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
