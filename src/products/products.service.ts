import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/shared/services/prisma.service';
import { PaginationDto } from 'src/common';

@Injectable()
export class ProductsService {
  private logger = new Logger(ProductsService.name);
  constructor(private prismaService: PrismaService) {}

  async create(createProductDto: CreateProductDto) {
    const product = await this.prismaService.product.create({
      data: createProductDto,
    });
    return product;
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const total = await this.prismaService.product.count({
      where: { available: true },
    });
    const lastPage = Math.ceil(total / limit);

    const data = await this.prismaService.product.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { available: true },
    });
    const meta = {
      total,
      page,
      lastPage,
    };
    return {
      data,
      meta,
    };
  }

  async findOne(id: number) {
    const product = await this.prismaService.product.findFirst({
      where: { id, available: true },
    });
    this.logger.log(`Finding product with id ${id}`);

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    this.logger.log(`Product with id ${id} found: ${JSON.stringify(product)}`);
    return product;
  }

  async update(updateProductDto: UpdateProductDto) {
    const { id, ...rest } = updateProductDto;

    await this.findOne(id);

    const product = await this.prismaService.product.update({
      where: { id, available: true },
      data: rest,
    });

    return product;
  }

  remove(id: number) {
    const product = this.prismaService.product.update({
      where: { id },
      data: { available: false },
    });
    return product;
  }
}
