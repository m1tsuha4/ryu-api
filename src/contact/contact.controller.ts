import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import { ContactUsDto } from './dto/contact-us.dto';
import { ContactEventDto } from './dto/contact-event.dto';

@ApiTags('Contact')
@Controller('contact')
export class ContactController {
    constructor(private readonly contactService: ContactService) { }

    @Post('contact-us')
    @ApiOperation({ summary: 'Send contact us email' })
    @ApiResponse({ status: 201, description: 'Email sent successfully.' })
    async contactUs(@Body() dto: ContactUsDto) {
        return this.contactService.sendContactUsEmail(dto);
    }

    @Post('contact-us-for-event')
    @ApiOperation({ summary: 'Send contact us for event email' })
    @ApiResponse({ status: 201, description: 'Email sent successfully.' })
    async contactUsForEvent(@Body() dto: ContactEventDto) {
        return this.contactService.sendContactUsEventEmail(dto);
    }
}
