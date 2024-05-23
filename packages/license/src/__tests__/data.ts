const data = [
  [
    'Format: Copyright (C) YEAR by AUTHOR EMAIL',
    'Copyright (C) YEAR by AUTHOR EMAIL',
  ],
  [
    'Format: <Asset Name> Copyright <Year> <Asset Owner>',
    '<Asset Name> Copyright <Year> <Asset Owner>',
  ],
  ['Format: Copyright (c) <year> <owner>', 'Copyright (c) <year> <owner>'],
  [
    'Format: Copyright (c) <YEAR> <COPYRIGHT HOLDERS>',
    'Copyright (c) <YEAR> <COPYRIGHT HOLDERS>',
  ],
  [
    'Format: Copyright (c) [xxxx]-[xxxx] [Owner Organization]',
    'Copyright (c) [xxxx]-[xxxx] [Owner Organization]',
  ],
  [
    'Format: Copyright (c) year copyright holder',
    'Copyright (c) year copyright holder',
  ],
  [
    'Format: Copyright (c) <year> <copyright holders>',
    `Copyright (c) <year> <copyright holders>
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM`,
  ],
  [
    'Format: Copyright © <YEAR> <HOLDERS> <PRODUCT>',
    'Copyright © <YEAR> <HOLDERS> <PRODUCT>',
  ],
  ['Format: <Copyright Information>', '<Copyright Information>', {}],
  ['Format: [ Copyleft Attitude ]', '[ Copyleft Attitude ]', {}],
  [
    'Format: [name of library]',
    'If you modify this Program, or any covered work, by linking or combining it with [name of library]',
  ],
  [
    'Format: [SOFTWARE NAME] Copyright (YEAR) (COPYRIGHT HOLDER(S)/AUTHOR(S))(“Licensor”)',
    '[SOFTWARE NAME] Copyright (YEAR) (COPYRIGHT HOLDER(S)/AUTHOR(S))(“Licensor”)',
  ],
  [
    'Format: Copyright <year> <copyright holder>',
    'Copyright <year> <copyright holder>',
  ],
  [
    'Format: <ORGANIZATION> ("<OWNER>")',
    '\n     a.  in the case of in the case of <ORGANIZATION> ("<OWNER>"), the Original Program, and',
  ],
  [
    'Format: Copyright [YEAR] [NAME] [EMAIL]',
    'Copyright [YEAR] [NAME] [EMAIL]',
  ],
  [
    'Format: Copyright <YEAR> <COPYRIGHT HOLDER>',
    'Copyright <YEAR> <COPYRIGHT HOLDER>',
  ],
  ['Format: <copyright notice>', '<copyright notice>', {}],
  [
    'Format: Copyright <yyyy, yyyy> The Open Group',
    'Copyright <yyyy, yyyy> The Open Group',
  ],
  ['Format: Copyright <2020,2024>', 'Copyright <2020,2024> The Open Group'],
  ['Format: Copyright <2019> <2024>', 'Copyright <2019> <2024> The Open Group'],
  ['Format: Copyright <2019-2024>', 'Copyright <2019-2024> The Open Group'],
  [
    'Format: Copyright (c) [Years] [name of copyright holder]',
    'Copyright (c) [Years] [name of copyright holder]\n\n[Software Name] is licensed under Mulan PSL v2.0\n\nCopyright (c) [Years] [name of copyright holder]',
  ],
  [
    'Format: Copyright (c) [2019] [name of copyright holder]',
    'Copyright (c) [2019] [name of copyright holder]\n[Software Name] is licensed under the Mulan PSL v1.0',
  ],
  [
    'Format: Copyright (c) <Year> <Owner Organization Name>  <Name of Development Group> <Name of Institution>',
    'Copyright (c) <Year> <Owner Organization Name>. All rights reserved.\n\nDeveloped by: <Name of Development Group> <Name of Institution> <URL for Development Group/Institution>',
  ],
  [
    'Format: Copyright (c) (CopyrightHoldersName) (From 4-digit-year)-(To 4-digit-year)',
    'Copyright (c) (CopyrightHoldersName) (From 4-digit-year)-(To 4-digit-year)',
  ],
  [
    'Format: Copyright (C) [dates of first publication]',
    'Copyright (C) [dates of first publication] Silicon Graphics, Inc. All Rights Reserved.',
  ],

  [
    'Format: Copyright © 2018 MongoDB, Inc.',
    `                    VERSION 1, OCTOBER 16, 2018

  Copyright © 2018 MongoDB, Inc.`,
    `Copyright (c) 2010-2011 Adaptive Computing Enterprises, Inc. All rights reserved.`,
  ],

  [
    'Format: Copyright (c) [year] [copyright holders]',
    `Copyright (c) [year] [copyright holders]`,
  ],
  [
    'Format: Copyright (C) 1994, 1995, 1997, 1998, 1999. All rights reserved.',
    'Copyright (C) 1994, 1995, 1997, 1998, 1999 Aladdin Enterprises, Menlo Park, California, U.S.A. All rights reserved.',
  ],
  [
    'Format: "[]"',
    `with the fields enclosed by brackets "[]" replaced with your own identifying information.
    Copyright [yyyy] [name of copyright owner]`,
  ],
].map(
  ([title, lic]) => [title, `License\n${lic}\nContent`] as [string, string],
);

export default data;
