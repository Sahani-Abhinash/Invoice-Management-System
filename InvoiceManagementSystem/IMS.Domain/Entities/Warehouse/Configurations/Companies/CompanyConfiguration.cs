using IMS.Domain.Entities.Company;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Persistence.Configurations.Companies
{
    public class CompanyConfiguration : IEntityTypeConfiguration<Company>
    {
        public void Configure(EntityTypeBuilder<Company> builder)
        {
            //builder.ToTable("Companies");
            //builder.HasKey(c => c.Id);

            //builder.Property(c => c.Name).IsRequired().HasMaxLength(200);
            //builder.Property(c => c.TaxNumber).HasMaxLength(50);

            // Seed initial companies
            //builder.HasData(
            //    new Company
            //    {
            //        Id = Guid.Parse("11111111-1111-1111-1111-111111111111"),
            //        Name = "ABC Pvt Ltd",
            //        TaxNumber = "TAX123456"
            //    },
            //    new Company
            //    {
            //        Id = Guid.Parse("22222222-2222-2222-2222-222222222222"),
            //        Name = "XYZ GmbH",
            //        TaxNumber = "TAX654321"
            //    }
            //);
        }
    }

}
