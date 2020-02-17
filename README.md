## 実行結果
```bash
$ yarn ts-node src/app.ts
# 略
[ User { id: 1, name: 'Tom', score: 0 } ]
start taskA
start taskA
query: START TRANSACTION
query: SELECT `User`.`id` AS `User_id`, `User`.`name` AS `User_name`, `User`.`score` AS `User_score` FROM `user` `User` WHERE `User`.`id` IN (?) LIMIT 1 FOR UPDATE -- PARAMETERS: [1]
query: START TRANSACTION
query: SELECT `User`.`id` AS `User_id`, `User`.`name` AS `User_name`, `User`.`score` AS `User_score` FROM `user` `User` WHERE `User`.`id` IN (?) LIMIT 1 FOR UPDATE -- PARAMETERS: [1]
query: SELECT `User`.`id` AS `User_id`, `User`.`name` AS `User_name`, `User`.`score` AS `User_score` FROM `user` `User` WHERE `User`.`id` IN (?) -- PARAMETERS: [1]
query: UPDATE `user` SET `score` = ? WHERE `id` IN (?) -- PARAMETERS: [100,1]
query: COMMIT
end taskA
query: SELECT `User`.`id` AS `User_id`, `User`.`name` AS `User_name`, `User`.`score` AS `User_score` FROM `user` `User` WHERE `User`.`id` IN (?) -- PARAMETERS: [1]
query: UPDATE `user` SET `score` = ? WHERE `id` IN (?) -- PARAMETERS: [200,1]
query: COMMIT
end taskA
query: SELECT `User`.`id` AS `User_id`, `User`.`name` AS `User_name`, `User`.`score` AS `User_score` FROM `user` `User`
[ User { id: 1, name: 'Tom', score: 200 } ]
```