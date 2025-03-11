import { google } from 'googleapis';
import fs from 'fs';

async function getServiceAccountKey() {
  try {
    // 환경 변수에서 서비스 계정 키 JSON 문자열 가져오기
    const keyJson = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
    
    if (!keyJson) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS_JSON 환경 변수가 설정되지 않았습니다.');
    }
    
    // JSON 문자열을 객체로 파싱
    return JSON.parse(keyJson);
  } catch (error) {
    console.error('Error getting service account key:', error);
    throw new Error('Failed to get service account key: ' + error.message);
  }
}

// 스프레드시트에서 해당 항목 찾기
async function findItemInSpreadsheet(sheets, spreadsheetId, range, movedItem) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    
    const rows = response.data.values || [];
    console.log(`Searching for item "${movedItem}" in ${rows.length} rows`);
    
    // B열(인덱스 1)에서 movedItem과 일치하는 행 찾기
    const rowIndex = rows.findIndex(row => row.length > 1 && row[1] === movedItem);
    
    if (rowIndex >= 0) {
      console.log(`Found item "${movedItem}" at row ${rowIndex + 1}`);
      return rowIndex + 1; // 1-indexed 행 번호 반환
    } else {
      console.log(`Item "${movedItem}" not found in spreadsheet`);
      return null;
    }
  } catch (error) {
    console.error('Error finding item in spreadsheet:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      console.log('Received request body:', req.body);
      const { movedItem, toButtonLabel } = req.body;
      
      if (!movedItem || !toButtonLabel) {
        return res.status(400).json({ 
          message: 'Bad Request: movedItem and toButtonLabel are required',
          receivedData: { movedItem, toButtonLabel }
        });
      }

      const credentials = await getServiceAccountKey();

      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });

      const client = await auth.getClient();
      const sheets = google.sheets({ version: 'v4', auth: client });

      const spreadsheetId = process.env.SPREADSHEET_ID;
      const range = 'ITW_GPR_BOOK!A:K';

      // 스프레드시트에서 해당 항목 찾기
      const rowIndex = await findItemInSpreadsheet(sheets, spreadsheetId, range, movedItem);
      
      if (rowIndex) {
        // 특정 행의 위치 열(H열)을 업데이트
        const updateRange = `ITW_GPR_BOOK!H${rowIndex}`;
        
        // 위치 정보에 'B1-' 접두사 추가
        const locationValue = toButtonLabel.startsWith('B1-') ? toButtonLabel : `B1-${toButtonLabel}`;
        
        console.log(`Updating item "${movedItem}" at row ${rowIndex}, setting location to "${locationValue}"`);
        
        const updateResponse = await sheets.spreadsheets.values.update({
          auth: client,
          spreadsheetId,
          range: updateRange,
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [[locationValue]],
          },
        });
        
        console.log('Google Sheets updated successfully:', updateResponse.data);
        res.status(200).json({ 
          message: 'Google Sheets updated successfully',
          item: movedItem,
          location: locationValue,
          rowIndex: rowIndex
        });
      } else {
        console.log(`Item "${movedItem}" not found in spreadsheet`);
        res.status(404).json({ message: `Item "${movedItem}" not found in spreadsheet` });
      }
    } catch (error) {
      console.error('Error processing request:', error);
      res.status(500).json({ 
        message: 'Failed to update Google Sheets!!',
        error: error.message,
        stack: error.stack
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
