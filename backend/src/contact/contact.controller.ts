import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ContactService } from './contact.service';
import { ContactDto } from './dto/contact.dto';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async submitContact(@Body() contactDto: ContactDto) {
    await this.contactService.sendContactEmail(contactDto);
    return {
      success: true,
      message: 'Your message has been sent successfully',
    };
  }
}
