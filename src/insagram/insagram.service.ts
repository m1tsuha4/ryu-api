import { Injectable, InternalServerErrorException } from '@nestjs/common';
import Axios from 'axios';

@Injectable()
export class InsagramService {
  async findAll(after?: string) {
    const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

    if (!accessToken) {
      throw new InternalServerErrorException(
        'INSTAGRAM_ACCESS_TOKEN environment variable not set',
      );
    }

    if (!process.env.INSTAGRAM_USER_ID) {
      throw new InternalServerErrorException(
        'INSTAGRAM_USER_ID environment variable not set',
      );
    }

    const params: Record<string, any> = {
      fields:
        'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp',
      limit: 10,
      access_token: accessToken,
    };

    if (
      after &&
      after.trim() !== '' &&
      after !== 'undefined' &&
      after !== 'null'
    ) {
      params.after = after;
    }

    try {
      const response = await Axios.get(
        `https://graph.facebook.com/v23.0/${process.env.INSTAGRAM_USER_ID}/media`,
        {
          params,
        },
      );

      const transformedData = response.data.data.map((item: any) => ({
        id: item.id,
        title: item.caption,
        link: item.permalink,
        image:
          item.media_type === 'VIDEO' ? item.thumbnail_url : item.media_url,
        created_at: item.timestamp,
      }));

      return {
        posts: transformedData,
        paging: response.data.paging,
      };
    } catch (error) {
      const errorMessage =
        error.response?.data?.error?.message ||
        'Failed to fetch Instagram posts';
      console.error('Instagram API Error:', error.response?.data);

      throw new InternalServerErrorException(errorMessage);
    }
  }
}
